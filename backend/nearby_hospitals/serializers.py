from rest_framework import serializers
from .models import *

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'
        
class BloodPacketSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer()
    class Meta:
        model = BloodPacket
        fields = '__all__'
        