package com.rnt.rent.service;

import java.util.List;
import java.util.Optional;
import com.rnt.rent.entity.Vehicle;

public interface VehicleService {

    List<Vehicle> getAllVehicles();

    Optional<Vehicle> getVehicleById(String id);

    Vehicle saveVehicle(Vehicle vehicle);
    
    void deleteVehicle(String id);
    
}