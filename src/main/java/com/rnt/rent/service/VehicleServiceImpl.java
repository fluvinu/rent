package com.rnt.rent.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rnt.rent.entity.Vehicle;
import com.rnt.rent.repository.VehicleRepository;
import com.rnt.rent.tenant.TenantContext;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleServiceImpl implements VehicleService {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findByIdAndTenantId(id, TenantContext.getTenantId());
    }

    @Override
    @Transactional
    public Vehicle saveVehicle(Vehicle vehicle) {
        if (vehicle.getTenantId() == null) {
            vehicle.setTenantId(TenantContext.getTenantId());
        }
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteByIdAndTenantId(id, TenantContext.getTenantId());
    }
}
