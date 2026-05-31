package com.locafy.media;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.locafy.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    public record VideoUploadResult(
            String publicId,
            String videoUrl,
            String thumbnailUrl,
            double duration,
            boolean ready
    ) {}

    private final Cloudinary cloudinary;
    private final boolean configured;
    private final String cloudName;
    private final String webhookUrl;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret,
            @Value("${cloudinary.webhook-url:}") String webhookUrl) {
        this.cloudName = cloudName;
        this.webhookUrl = webhookUrl;
        this.configured = StringUtils.hasText(cloudName)
                && StringUtils.hasText(apiKey)
                && StringUtils.hasText(apiSecret);
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        validateFile(file);
        if (!configured) {
            throw new BusinessException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
        }
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "format", "webp",
                "quality", "auto:good",
                "fetch_format", "auto"
        ));
        return (String) result.get("secure_url");
    }

    public VideoUploadResult uploadReelVideo(MultipartFile file, String vendorId) throws IOException {
        validateVideoFile(file);
        if (!configured) {
            throw new BusinessException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
        }

        Map<String, Object> params = ObjectUtils.asMap(
                "resource_type", "video",
                "folder", "reels/" + vendorId,
                "eager", List.of(ObjectUtils.asMap(
                        "streaming_profile", "hd",
                        "format", "m3u8"
                ))
        );
        if (StringUtils.hasText(webhookUrl)) {
            params.put("eager_async", true);
            params.put("notification_url", webhookUrl);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), params);
        String publicId = (String) result.get("public_id");
        String secureUrl = (String) result.get("secure_url");
        double duration = result.get("duration") instanceof Number n ? n.doubleValue() : 0.0;

        String videoUrl = secureUrl;
        boolean ready = !StringUtils.hasText(webhookUrl);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> eager = (List<Map<String, Object>>) result.get("eager");
        if (eager != null && !eager.isEmpty() && eager.get(0).get("secure_url") != null) {
            videoUrl = (String) eager.get(0).get("secure_url");
            ready = true;
        }

        return new VideoUploadResult(
                publicId,
                videoUrl,
                buildVideoThumbnailUrl(publicId),
                duration,
                ready
        );
    }

    public void deleteVideo(String publicId) {
        if (!configured || !StringUtils.hasText(publicId)) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
        } catch (Exception ignored) {
            // Best-effort cleanup
        }
    }

    public String buildVideoThumbnailUrl(String publicId) {
        if (!StringUtils.hasText(cloudName) || !StringUtils.hasText(publicId)) {
            return null;
        }
        return String.format(
                "https://res.cloudinary.com/%s/video/upload/so_0,w_400,h_711,c_fill/%s.jpg",
                cloudName, publicId
        );
    }

    public void deleteImage(String imageUrl) {
        if (!configured || !StringUtils.hasText(imageUrl)) {
            return;
        }
        try {
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception ignored) {
            // Best-effort cleanup
        }
    }

    private void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Video file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new BusinessException("Only video files are allowed (MP4, MOV)");
        }
        if (file.getSize() > 100 * 1024 * 1024) {
            throw new BusinessException("Video must be under 100MB");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("Only image files are allowed");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("Image must be under 10MB");
        }
    }

    private String extractPublicId(String url) {
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx < 0) return null;
        String path = url.substring(uploadIdx + 8);
        int versionIdx = path.indexOf("/v");
        if (versionIdx == 0) {
            int slash = path.indexOf('/', 2);
            if (slash > 0) path = path.substring(slash + 1);
        }
        int dot = path.lastIndexOf('.');
        return dot > 0 ? path.substring(0, dot) : path;
    }
}
