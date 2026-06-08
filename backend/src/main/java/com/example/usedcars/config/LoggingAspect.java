package com.example.usedcars.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingAspect.class);

    @Around("within(com.example.usedcars.controller..*) || within(com.example.usedcars.service..*)")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String methodName = joinPoint.getSignature().toShortString();
        LOGGER.info("Starting {}", methodName);
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - startTime;
            LOGGER.info("Completed {} in {} ms", methodName, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - startTime;
            LOGGER.warn("Failed {} after {} ms", methodName, duration);
            throw ex;
        }
    }

    @AfterThrowing(pointcut = "within(com.example.usedcars.controller..*) || within(com.example.usedcars.service..*)", throwing = "ex")
    public void logException(Exception ex) {
        LOGGER.error("Application exception: {}", ex.getMessage());
    }
}
