package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.admin.model.PlatformSettings;
import com.locafy.admin.repository.PlatformSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private final PlatformSettingsRepository settingsRepository;
    private final AuditLogService auditLogService;

    @Value("${app.platform-fee-percent:10}")
    private double defaultPlatformFeePercent;

    public AdminDto.SettingsResponse getSettings() {
        return AdminDto.SettingsResponse.from(getOrCreate());
    }

    @Transactional
    public AdminDto.SettingsResponse updateSettings(String adminId, AdminDto.UpdateSettingsRequest req, String ip) {
        PlatformSettings settings = getOrCreate();
        if (req.getPlatformFeePercent() != null) settings.setPlatformFeePercent(req.getPlatformFeePercent());
        if (req.getDeliveryFeeBase() != null) settings.setDeliveryFeeBase(req.getDeliveryFeeBase());
        if (req.getDeliveryFeePerKm() != null) settings.setDeliveryFeePerKm(req.getDeliveryFeePerKm());
        if (req.getMaxDeliveryRadiusKm() != null) settings.setMaxDeliveryRadiusKm(req.getMaxDeliveryRadiusKm());
        if (req.getMaintenanceMode() != null) settings.setMaintenanceMode(req.getMaintenanceMode());
        if (req.getAnnouncementBanner() != null) settings.setAnnouncementBanner(req.getAnnouncementBanner());
        settings = settingsRepository.save(settings);
        auditLogService.record(adminId, AuditLog.Action.SETTINGS_UPDATED, settings.getId(),
                AuditLog.TargetType.SETTINGS, "Platform settings updated", ip);
        return AdminDto.SettingsResponse.from(settings);
    }

    private PlatformSettings getOrCreate() {
        return settingsRepository.findById(PlatformSettings.SINGLETON_ID)
                .orElseGet(() -> settingsRepository.save(PlatformSettings.builder()
                        .platformFeePercent(defaultPlatformFeePercent)
                        .build()));
    }
}
