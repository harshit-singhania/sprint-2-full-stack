package com.example.usedcars.service;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.PurchaseOrder;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class NotificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private UserRepository userRepository;

    @Value("${notification.email.enabled}")
    private boolean emailEnabled;

    @Value("${notification.email.from}")
    private String fromAddress;

    public void notifyUserRegistered(AppUser user) {
        sendIfPresent(user.getEmail(),
                "Registration successful",
                "Hi " + user.getUsername() + ", your " + user.getRole().name().toLowerCase()
                        + " account has been registered successfully.");

        String adminBody = "New user registered: " + user.getUsername() + " (" + user.getRole() + ")";
        sendToAdmins("New user registration", adminBody);
    }

    public void notifyPurchaseCreated(PurchaseOrder order) {
        String subject = "New purchase request for " + order.getCar().getMake() + " " + order.getCar().getModel();
        String body = "Buyer " + order.getBuyer().getUsername()
                + " created purchase order #" + order.getId()
                + " for car #" + order.getCar().getId()
                + ". Amount: " + order.getPayment().getAmount()
                + ". Status: " + order.getStatus();

        sendIfPresent(order.getSeller().getEmail(), subject, body);
        sendToAdmins("New car purchase request", body);
    }

    private void sendToAdmins(String subject, String body) {
        List<AppUser> admins = userRepository.findByRole(Role.ADMIN);
        for (AppUser admin : admins) {
            sendIfPresent(admin.getEmail(), subject, body);
        }
    }

    private void sendIfPresent(String recipient, String subject, String body) {
        if (!StringUtils.hasText(recipient)) {
            LOGGER.info("Skipping email notification '{}' because recipient email is missing", subject);
            return;
        }
        if (!emailEnabled) {
            LOGGER.info("Email notification disabled. Would send '{}' to {}", subject, recipient);
            return;
        }
        if (mailSender == null) {
            LOGGER.warn("Email notification enabled but JavaMailSender is not configured");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            LOGGER.info("Email notification '{}' sent to {}", subject, recipient);
        } catch (RuntimeException ex) {
            LOGGER.error("Failed to send email notification '{}' to {}", subject, recipient, ex);
        }
    }
}
