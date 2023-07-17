from django.db import models
from accounts.models import *

BLOOD_TYPE_CHOICES = (
    ('A+','A positive'),
    ('A-','A negative'),
    ('B+','B positive'),
    ('B-','B negative'),
    ('AB+','AB postive'),
    ('AB-','AB negative'),
    ('O+','O positive'),
    ('O-','O negative')
)
class BloodPacket(models.Model):
    blood_type = models.CharField(max_length=400,choices=BLOOD_TYPE_CHOICES)
    units_available = models.IntegerField()
    hospital = models.ForeignKey('Hospital',on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.hospital} - {self.blood_type}"
    
class Hospital(models.Model):
    name = models.CharField(max_length=150, unique=True)
    coordinates = models.OneToOneField('accounts.Coordinate',on_delete=models.SET_NULL,null=True,blank=True)
    
    def __str__(self):
        return self.name
    
    
