package com.rnt.rent.controller;


import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rnt.rent.entity.Customer;
import com.rnt.rent.entity.Vehicle;
import com.rnt.rent.entity.Vorder;
import com.rnt.rent.service.CustomerServices;
import com.rnt.rent.service.VehicleService;
import com.rnt.rent.service.VorderServices;

@RestController
@RequestMapping("/ord")
public class VorderController {
	
	@Autowired
	private VorderServices vorder;
	
	@Autowired
	private CustomerServices cusv;
	
	@Autowired
	private VehicleService vse;
	
	@GetMapping("/hi")
	public String test() {
		return "order Controller";
	}
	
	@GetMapping
	public List<Vorder> getAllOrders(){
		return vorder.allorder();
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Vorder> getVOrderById(@PathVariable Long id){
		
		Optional<Vorder> cus=vorder.getVorderById(id);
		
		return cus.map(ResponseEntity::ok).orElseGet(()-> ResponseEntity.notFound().build());
		
	}
	
	@PostMapping("/{vId}/{cId}")
	public ResponseEntity<Vorder> creatrVorder(@RequestBody Vorder vord, @PathVariable Long vId, @PathVariable Long cId) {
	    

	    // Fetch customer and vehicle using their IDs
	    Optional<Customer> optionalCustomer = cusv.getCustomerById(cId);
	    Optional<Vehicle> optionalVehicle = vse.getVehicleById(vId);

	    // Check if customer and vehicle are present
	    if (!optionalCustomer.isPresent()) {
	        return ResponseEntity.notFound().build(); // Customer not found
	    }
	    if (!optionalVehicle.isPresent()) {
	        return ResponseEntity.notFound().build(); // Vehicle not found
	    }

	    // Set customer and vehicle to order
	    Customer cu = optionalCustomer.get();
	    Vehicle veh = optionalVehicle.get();
	    vord.setCustomer(cu); // Assuming there's a setCustomer method in Vorder
	    vord.setVehicle(veh); // Assuming there's a setVehicle method in Vorder
	    vord.settDate(Timestamp.valueOf(LocalDateTime.now()));
	    vord.setcName(cu.getcName());
	    Vorder createdVorder = vorder.createVorder(vord);
	    return ResponseEntity.ok(createdVorder);
	}

	
	@PutMapping("/{id}")
	public ResponseEntity<Vorder> submitVehical(@RequestBody Vorder v,@PathVariable Long id){
		
		// if not worki we hav to create a local varealte of time stem then  fatch the stored value of time then stor it on local 
		// vareable and then reuse it and set thet vare to over object
		
		if(!vorder.getVorderById(id).isPresent()) {
			return ResponseEntity.notFound().build();
		}
		
		v=vorder.getVorderById(id).get();
		
		
		
		Timestamp retunDate=Timestamp.valueOf(LocalDateTime.now());
		v.setrDate(retunDate);
		double totalamt=getAmtByTime(v.gettDate(),retunDate);
		v.setTotal(totalamt);
		
		Vorder updetedVorder=vorder.createVorder(v);
		return ResponseEntity.ok(updetedVorder);
		
	}
	
	

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
		if(!vorder.getVorderById(id).isPresent()) {
			return ResponseEntity.notFound().build();
		}
		vorder.deleteOrderById(id);
		return ResponseEntity.noContent().build();
		
	}
	
	
	private double getAmtByTime(Timestamp take, Timestamp retune) {
	    // Validate that return time is not before the take time
	    if (retune.before(take)) {
	        throw new IllegalArgumentException("Return time cannot be before take time");
	    }
	    
	    // Get time in milliseconds
	    long takeMillis = take.getTime();
	    long retuneMillis = retune.getTime();
	    
	    // Calculate the difference in milliseconds
	    long diffMillis = retuneMillis - takeMillis;
	    
	    // Convert milliseconds to minutes
	    double diffMinutes = diffMillis / (1000.0 * 60);
	    
	    // Define the rate per minute
	    double ratePerMinute = 10.0; // 10 rupees per minute
	    
	    // Calculate the total amount
	    double amount = diffMinutes * ratePerMinute;
	    
	    // Return the calculated amount
	    return amount;
	}

}
