from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import *
import geopy.distance
from accounts.models import User
from .models import *


class Nearby_Hospital(APIView):
    def get(self,request,pk):
        user = User.objects.filter(id=pk)
        if user.exists() is False:
            return Response({'message': 'User not  Exist'}, status=status.HTTP_404_NOT_FOUND)
        
        user = user.first()
        
        if user.coordinates is None:
            return Response({'message': 'Users coordinates not exists'}, status=status.HTTP_404_NOT_FOUND)
        hospitals = Hospital.objects.all()
        
        print('debug 1')
        user_long = float(user.coordinates.longitude)
        user_lat = float(user.coordinates.latitude)
            
        response = []
        for hospital in hospitals:
            coords_1 = (user_lat, user_long)
            coords_2 = (hospital.coordinates.latitude, hospital.coordinates.longitude)
            
            distance = round(geopy.distance.geodesic(coords_1, coords_2).km, 2)
            print(distance)
            if distance <= 15:
                blood_packets = BloodPacket.objects.filter(hospital=hospital)
                for packet in blood_packets:     
                    response.append({
                        'hospital_name': f'{hospital.name}',
                        'blood_type': packet.blood_type,
                        'units_available': packet.units_available,
                        'distance': distance
                    })
            
            
        
        return Response(response, status=status.HTTP_200_OK)
