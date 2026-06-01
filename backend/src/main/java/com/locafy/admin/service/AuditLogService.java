package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.admin.repository.AuditLogRepository;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AdminDto.AuditLogPageResponse list(int page, int size) {
        var result = auditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
        return AdminDto.AuditLogPageResponse.builder()
                .content(result.getContent().stream().map(AdminDto.AuditLogResponse::from).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    public void record(String adminId, AuditLog.Action action, String targetId,
                       AuditLog.TargetType targetType, String details, String ip) {
        String adminEmail = userRepository.findById(adminId)
                .map(u -> u.getEmail())
                .orElse(null);
        auditLogRepository.save(AuditLog.builder()
                .adminId(adminId)
                .adminEmail(adminEmail)
                .action(action)
                .targetId(targetId)
                .targetType(targetType)
                .details(details)
                .ip(ip)
                .build());
    }
}
