package com.example.usedcars.service.impl;

import com.example.usedcars.dto.ApiMessage;
import com.example.usedcars.dto.CarListingResponse;
import com.example.usedcars.dto.CarRequest;
import com.example.usedcars.exception.ApiException;
import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.CarCondition;
import com.example.usedcars.model.FuelType;
import com.example.usedcars.model.RecentView;
import com.example.usedcars.model.Role;
import com.example.usedcars.model.TransmissionType;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.RecentViewRepository;
import com.example.usedcars.service.CarService;
import com.example.usedcars.service.SessionService;
import com.example.usedcars.service.SessionTokenService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarServiceImpl implements CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private RecentViewRepository recentViewRepository;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionTokenService sessionTokenService;

    @Override
    @Transactional
    public CarListingResponse addCar(String token, CarRequest request) {
        AppUser user = sessionService.requireRole(token, Role.USER);
        Car car = new Car();
        applyRequest(car, request);
        car.setAvailable(false);
        car.setApprovalStatus(ApprovalStatus.PENDING_ADMIN_APPROVAL);
        car.setSeller(user);
        Car saved = carRepository.save(car);
        return new CarListingResponse(
                "Your car listing has been submitted successfully and is pending admin approval.",
                saved
        );
    }

    @Override
    @Transactional
    public Car updateCar(String token, Long carId, CarRequest request) {
        AppUser user = sessionService.requireUser(token);
        Car car = getCar(carId);
        ensureCarOwnerOrAdmin(user, car);
        applyRequest(car, request);
        if (user.getRole() != Role.ADMIN) {
            car.setAvailable(false);
            car.setApprovalStatus(ApprovalStatus.PENDING_ADMIN_APPROVAL);
        }
        return carRepository.save(car);
    }

    @Override
    @Transactional
    public ApiMessage deleteCar(String token, Long carId) {
        AppUser user = sessionService.requireUser(token);
        Car car = getCar(carId);
        ensureCarOwnerOrAdmin(user, car);
        carRepository.delete(car);
        return new ApiMessage("Car deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Car> browseAvailable(String token) {
        AppUser user = sessionService.requireUser(token);
        if (user.getRole() == Role.ADMIN) {
            return carRepository.findByAvailableTrueAndApprovalStatus(ApprovalStatus.APPROVED);
        }
        return carRepository.findByAvailableTrueAndApprovalStatusAndSellerNot(ApprovalStatus.APPROVED, user);
    }

    @Override
    @Transactional
    public Car viewDetails(String token, Long carId) {
        AppUser user = sessionService.requireUser(token);
        Car car = getCar(carId);
        if (car.getApprovalStatus() != ApprovalStatus.APPROVED && user.getRole() != Role.ADMIN
                && !car.getSeller().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Car listing is not approved yet");
        }
        car.setViewCount(car.getViewCount() + 1);
        RecentView view = new RecentView();
        view.setUser(user);
        view.setCar(car);
        // Store token hash, not the raw token
        view.setSessionToken(sessionTokenService.hashToken(token));
        view.setViewedAt(LocalDateTime.now());
        recentViewRepository.save(view);
        return carRepository.save(car);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentView> recentViews(String token) {
        sessionService.requireUser(token);
        return recentViewRepository.findTop10BySessionTokenOrderByViewedAtDesc(
                sessionTokenService.hashToken(token));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Car> compare(String token, Long firstCarId, Long secondCarId) {
        sessionService.requireUser(token);
        return List.of(getCar(firstCarId), getCar(secondCarId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Car> popular(String token) {
        sessionService.requireUser(token);
        return carRepository.findTop5ByOrderByViewCountDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Car> pendingApproval(String token) {
        sessionService.requireRole(token, Role.ADMIN);
        return carRepository.findByApprovalStatus(ApprovalStatus.PENDING_ADMIN_APPROVAL);
    }

    @Override
    @Transactional
    public Car approveListing(String token, Long carId) {
        sessionService.requireRole(token, Role.ADMIN);
        Car car = getCar(carId);
        car.setApprovalStatus(ApprovalStatus.APPROVED);
        car.setAvailable(true);
        return carRepository.save(car);
    }

    @Override
    @Transactional
    public Car rejectListing(String token, Long carId) {
        sessionService.requireRole(token, Role.ADMIN);
        Car car = getCar(carId);
        car.setApprovalStatus(ApprovalStatus.REJECTED);
        car.setAvailable(false);
        return carRepository.save(car);
    }

    @Override
    public Car getCar(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void applyRequest(Car car, CarRequest request) {
        // Core fields
        car.setMake(request.make());
        car.setModel(request.model());
        car.setYear(request.year());
        car.setPrice(request.price());
        car.setMileage(request.mileage());
        car.setColor(request.color());

        // Condition fields — fall back to entity defaults when omitted
        car.setCondition(request.condition() != null ? request.condition() : CarCondition.GOOD);
        car.setFuelType(request.fuelType() != null ? request.fuelType() : FuelType.PETROL);
        car.setTransmission(request.transmission() != null ? request.transmission() : TransmissionType.MANUAL);
        if (request.bodyType() != null) car.setBodyType(request.bodyType());
        car.setNumberOfOwners(request.numberOfOwners() != null ? request.numberOfOwners() : 1);
        if (request.engineCc() != null) car.setEngineCc(request.engineCc());
        car.setInsured(Boolean.TRUE.equals(request.insured()));
        car.setPucValid(Boolean.TRUE.equals(request.pucValid()));
        if (request.description() != null) car.setDescription(request.description());

        // `available` is handled by addCar / updateCar directly for non-admin users;
        // here we only apply it when explicitly provided (admin edits)
        if (request.available() != null) {
            car.setAvailable(request.available());
        }
    }

    private void ensureCarOwnerOrAdmin(AppUser user, Car car) {
        if (user.getRole() == Role.ADMIN) return;
        if (!car.getSeller().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User can manage only their own cars");
        }
    }
}
