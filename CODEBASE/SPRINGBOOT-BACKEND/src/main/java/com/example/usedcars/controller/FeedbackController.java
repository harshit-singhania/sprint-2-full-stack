package com.example.usedcars.controller;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.FeedbackRequest;
import com.example.usedcars.model.Feedback;
import com.example.usedcars.service.FeedbackService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    @PostMapping
    public ApiMessage submit(@RequestHeader("X-Session-Token") String token,
                             @Valid @RequestBody FeedbackRequest request) {
        return feedbackService.submit(token, request);
    }

    @GetMapping("/admin")
    public Object all(@RequestHeader("X-Session-Token") String token) {
        List<Feedback> feedback = feedbackService.all(token);
        return feedback.isEmpty() ? new ApiMessage("No feedback found") : feedback;
    }
}
