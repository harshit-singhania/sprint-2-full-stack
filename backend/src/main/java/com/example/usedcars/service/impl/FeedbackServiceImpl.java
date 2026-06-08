package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.FeedbackRequest;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.Feedback;
import com.example.usedcars.model.Role;
import com.example.usedcars.repository.FeedbackRepository;
import com.example.usedcars.service.FeedbackService;
import com.example.usedcars.service.SessionService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackServiceImpl implements FeedbackService {
    @Autowired
    private SessionService sessionService;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Override
    @Transactional
    public ApiMessage submit(String token, FeedbackRequest request) {
        AppUser user = sessionService.requireUser(token);
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setMessage(request.message());
        feedbackRepository.save(feedback);
        return new ApiMessage("Feedback submitted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Feedback> all(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return feedbackRepository.findAll();
    }
}
