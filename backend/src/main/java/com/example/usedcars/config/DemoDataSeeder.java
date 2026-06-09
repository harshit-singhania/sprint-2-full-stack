package com.example.usedcars.config;

import com.example.usedcars.model.AppUser;
import com.example.usedcars.model.ApprovalStatus;
import com.example.usedcars.model.Car;
import com.example.usedcars.model.Role;
import com.example.usedcars.model.SupportTicket;
import com.example.usedcars.model.TicketResponse;
import com.example.usedcars.model.TicketStatus;
import com.example.usedcars.repository.CarRepository;
import com.example.usedcars.repository.SupportTicketRepository;
import com.example.usedcars.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Component
@ConditionalOnProperty(prefix = "app.demo", name = "seed-support-tickets", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {
    private static final String DEMO_PASSWORD = "Demo@12345";
    private static final String DEMO_ADMIN_PASSWORD = "Demo@1234x";

    private final UserRepository userRepository;
    private final SupportTicketRepository ticketRepository;
    private final CarRepository carRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DemoDataSeeder(UserRepository userRepository,
                          SupportTicketRepository ticketRepository,
                          CarRepository carRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.carRepository = carRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        AppUser demoAdmin = upsertUser("demoadmin", "Demo Admin", "9000000000", "demoadmin@usedcars.local", Role.ADMIN);
        AppUser demoBuyer = upsertUser("demouser", "Demo Buyer", "9000000001", "demouser@usedcars.local", Role.USER);
        AppUser demoSeller = upsertUser("demoseller", "Demo Seller", "9000000002", "demoseller@usedcars.local", Role.USER);

        seedCars(demoSeller);

        List<AppUser> buyers = userRepository.findByRole(Role.USER);
        AppUser admin = Optional.ofNullable(demoAdmin)
                .orElseGet(() -> userRepository.findByRole(Role.ADMIN).stream().findFirst().orElse(null));

        for (AppUser buyer : buyers) {
            List<SupportTicket> tickets = ticketRepository.findByBuyer(buyer);
            if (tickets.isEmpty()) {
                tickets.add(ticketRepository.save(createTicket(
                        buyer,
                        "Issue with profile verification",
                        "I finished registration, but my account still shows as pending verification.",
                        TicketStatus.OPEN,
                        null,
                        null)));

                tickets.add(ticketRepository.save(createTicket(
                        buyer,
                        "Questions about a recent purchase",
                        "I need help understanding the next steps after placing an order.",
                        TicketStatus.CLOSED,
                        admin,
                        "Thanks for reaching out. Your order is in progress and the seller will be notified.")));
            }

            if (admin != null) {
                seedAdminReplies(tickets, admin);
            }
        }
    }

    private SupportTicket createTicket(AppUser buyer,
                                       String subject,
                                       String description,
                                       TicketStatus status,
                                       AppUser responder,
                                       String responseMessage) {
        SupportTicket ticket = new SupportTicket();
        ticket.setBuyer(buyer);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setStatus(status);

        if (responder != null && responseMessage != null) {
            TicketResponse response = new TicketResponse();
            response.setSender(responder);
            response.setTicket(ticket);
            response.setMessage(responseMessage);
            ticket.getResponses().add(response);
        }

        return ticket;
    }

    private AppUser upsertUser(String username, String name, String phoneNumber, String email, Role role) {
        AppUser user = userRepository.findByUsername(username).orElseGet(AppUser::new);
        user.setUsername(username);
        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(role == Role.ADMIN ? DEMO_ADMIN_PASSWORD : DEMO_PASSWORD));
        user.setRole(role);
        user.setActiveSessionTokenHash(null);
        user.setActiveSessionExpiresAt(null);
        return userRepository.save(user);
    }

    private void seedCars(AppUser seller) {
        if (seller == null || carRepository.countBySeller(seller) > 0) {
            return;
        }
        // Make/model strings match the frontend image library (car-images.ts) so each
        // seeded listing renders with real local photos on /browse.
        carRepository.save(createCar(seller, "Honda", "Amaze", 2019, 650000, 38000, "White"));
        carRepository.save(createCar(seller, "Toyota", "Innova Crysta", 2020, 1850000, 52000, "Silver"));
        carRepository.save(createCar(seller, "Tata", "Harrier", 2021, 1650000, 29000, "Black"));
        carRepository.save(createCar(seller, "Hyundai", "i20", 2022, 850000, 18000, "Blue"));
        carRepository.save(createCar(seller, "Mahindra", "Scorpio", 2020, 1450000, 41000, "Red"));
        carRepository.save(createCar(seller, "Kia", "Sonet", 2021, 980000, 23000, "White"));
        carRepository.save(createCar(seller, "Maruti", "Swift", 2019, 560000, 47000, "Grey"));
        carRepository.save(createCar(seller, "Volkswagen", "Taigun", 2022, 1320000, 15000, "Orange"));
    }

    private Car createCar(AppUser seller, String make, String model, int year, long price, int mileage, String color) {
        Car car = new Car();
        car.setSeller(seller);
        car.setMake(make);
        car.setModel(model);
        car.setYear(year);
        car.setPrice(BigDecimal.valueOf(price));
        car.setMileage(mileage);
        car.setColor(color);
        car.setAvailable(true);
        car.setApprovalStatus(ApprovalStatus.APPROVED);
        return car;
    }

    private void seedAdminReplies(List<SupportTicket> tickets, AppUser admin) {
        int repliesAdded = 0;

        for (SupportTicket ticket : tickets) {
            if (!ticket.getResponses().isEmpty()) {
                continue;
            }

            TicketResponse response = new TicketResponse();
            response.setSender(admin);
            response.setTicket(ticket);
            response.setMessage("Thanks for the update. We’re looking into this and will follow up shortly.");
            ticket.getResponses().add(response);
            ticketRepository.save(ticket);

            repliesAdded++;
            if (repliesAdded >= 2) {
                break;
            }
        }
    }
}
