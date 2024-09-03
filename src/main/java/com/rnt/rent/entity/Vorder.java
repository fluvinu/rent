package com.rnt.rent.entity;

import java.sql.Timestamp;
//Added semicolon here
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "vorder")
public class Vorder {
	 @Id
	 @GeneratedValue(strategy = GenerationType.AUTO)
	 private Long oId;
	
	 private String cName; 
	
	 private Timestamp tDate;
	 private Timestamp rDate;
	
	 @OneToOne
	 @JoinColumn(name = "vehicle_id") // Use a proper join column
	 private Vehicle vehicle;
	
	 @OneToOne
	 @JoinColumn(name = "customer_id") // Use a proper join column
	 private Customer customer;
	 
	 
	 private double total;



// Getters and Setters
 
 public Long getoId() {
     return oId;
 }

 public void setoId(Long oId) {
     this.oId = oId;
 }

 public String getcName() {
     return cName;
 }

 public void setcName(String cName) {
     this.cName = cName;
 }

 public Timestamp gettDate() {
     return tDate;
 }

 public void settDate(Timestamp tDate) {
     this.tDate = tDate;
 }

 public Timestamp getrDate() {
     return rDate;
 }

 public void setrDate(Timestamp rDate) {
     this.rDate = rDate;
 }

 public Vehicle getVehicle() {
     return vehicle;
 }

 public void setVehicle(Vehicle vehicle) {
     this.vehicle = vehicle; // Removed the extra 'a'
 }

 public Customer getCustomer() {
     return customer;
 }

 public void setCustomer(Customer customer) {
     this.customer = customer;
 }
 
 public double getTotal() {
	return total;
}

 public void setTotal(double total) {
	this.total = total;
}

}