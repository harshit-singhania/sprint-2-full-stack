package com.example.usedcars.service;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.FeedbackRequest;
import com.example.usedcars.model.Feedback;
import java.util.List;

public interface FeedbackService {
    ApiMessage submit(String token, FeedbackRequest request);
    List<Feedback> all(String token);
}
