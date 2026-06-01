package com.locafy.admin.service;

import com.locafy.admin.dto.AdminDto;
import com.locafy.admin.model.AuditLog;
import com.locafy.common.exception.ResourceNotFoundException;
import com.locafy.user.model.User;
import com.locafy.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminDto.UserPageResponse listUsers(User.Role role, int page, int size) {
        Page<User> result = role != null
                ? userRepository.findByRoleOrderByCreatedAtDesc(role, PageRequest.of(page, size))
                : userRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return AdminDto.UserPageResponse.builder()
                .content(result.getContent().stream().map(AdminDto.UserSummary::from).toList())
                .totalElements(result.getTotalElements())
                .page(page)
                .size(size)
                .hasMore(result.hasNext())
                .build();
    }

    @Transactional
    public AdminDto.UserSummary updateStatus(String adminId, String userId,
                                             AdminDto.UpdateUserStatusRequest req, String ip) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new com.locafy.common.exception.BusinessException("Cannot modify admin accounts via API");
        }
        user.setIsActive(req.getActive());
        user = userRepository.save(user);

        AuditLog.Action action = Boolean.TRUE.equals(req.getActive())
                ? AuditLog.Action.USER_ACTIVATED
                : AuditLog.Action.USER_SUSPENDED;
        String details = Boolean.TRUE.equals(req.getActive())
                ? "User reinstated"
                : "User suspended" + (req.getReason() != null ? ": " + req.getReason() : "");
        auditLogService.record(adminId, action, userId, AuditLog.TargetType.USER, details, ip);
        return AdminDto.UserSummary.from(user);
    }
}
