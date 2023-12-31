from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from donor.models import Donor
from accounts.models import User, Coordinate
from .serializers import DonationRequestSerializer
from .emails import send_email_create, send_fullfilled_email, send_accepted_email

BLOOD_GROUPS_MAPPER = {
    'A+': ['A+', 'AB+'],
    'A-': ['A-', 'A+', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B-', 'B+', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
}

class DonationRequestView(APIView):
    def post(self, request):
        try:
            data = request.data
            serializer = DonationRequestSerializer(data=data)
            serializer_check = serializer.is_valid()
            requested_by = serializer.data['requested_by']
            phone_number = serializer.data['phone_number']
            blood_group = serializer.data['blood_group']
            required_on = serializer.data['required_on']
            place_of_donation = serializer.data['place_of_donation']
            units_required = serializer.data['units_required']
            try:
                reason = serializer.data['reason']
            except Exception as e:
                reason = None
            type_of_donation = serializer.data['type_of_donation']
            is_urgent = serializer.data['is_urgent']
                
            user = User.objects.get(id=requested_by)
            if user is None:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                coordinate = Coordinate.objects.get(id=user.coordinates.id)
            except:
                return Response({'message': 'Please update your location'}, status=status.HTTP_404_NOT_FOUND)
            
            print(coordinate.longitude, coordinate.latitude)
            

            donation = DonationRequest(requested_by=user,phone_number=phone_number,
                                        blood_group=blood_group,required_on=required_on,
                                        place_of_donation=place_of_donation,
                                        units_required=units_required,reason=reason,
                                        type_of_donation=type_of_donation,
                                        is_urgent=is_urgent,
                                        coordinates=coordinate)
                                        
            donation.save()
            send_email_create(email=user.email)
            response = {
                'message': 'Donation Request Submitted Succesfully'
            }
            
            return Response(response, status=status.HTTP_201_CREATED)
            # else:
            #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            print(e)
            return Response({'message': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)
        
class DonationStatusUpdate(APIView):
    def put(self, request, pk):
        try:
            donation = DonationRequest.objects.get(request_id=pk)
            print(donation)
        except DonationRequest.DoesNotExist:
            return Response({'message': 'Donation Request does not exist'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data
        donor_id = data['donor_id']
        donor = Donor.objects.filter(id=donor_id)
        print(donor)
        if donor.exists() is False:
            return Response({'message': 'Donor not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = DonationRequestSerializer(DonationRequest,data=request.data,partial=True)
        #serializer.is_valid(raise_exception=True)
        if data['current_status'] == 'active':
            if  donation.current_status == 'pending':
                donation.current_status = 'active'
                donation.donor_id = donor.first()
                donor = donor.first()
                donor.active_donation_request = donation
                donor.save()
                donation.save()
                send_accepted_email(donor_email = donation.donor_id.user.email, receiver_email= donation.requested_by.email)
                return Response({"message":" Donation Status successfully Updated"},status=status.HTTP_200_OK)
            
            else:
                return Response({"message":"mismatch in status",
                                 "current_status":donation.current_status}, status=status.HTTP_400_BAD_REQUEST)
        elif data['current_status'] == 'fullfilled' and donation.current_status == 'active':
                if donation.donor_id.id == donor_id:
                    donation.is_fullfiled = True
                    donation.current_status = 'fullfilled'
                    donor = donor.first()
                    donor.donation_count = donor.donation_count + 1
                    donor.level = donor.level + 0.2
                    donor.active_donation_request = None
                    donor.save()
                    donation.save()
                    send_fullfilled_email(donor_email = donation.donor_id.user.email, receiver_email= donation.requested_by.email)
                    return Response({"message":" Donation Status successfully Updated","isfullfiled":donation.is_fullfiled},status=status.HTTP_200_OK)
                    
                else:
                    
                    return Response({"message":"Donor does not match","current_status":donation.current_status}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"mismatch in status","current_status":donation.current_status}, status=status.HTTP_400_BAD_REQUEST)
    
    
class PendingDonationsListView(APIView):
    def post(self, request):
        try:
            data = request.data
            donor_id = data['donor_id']
            donor = Donor.objects.filter(id=donor_id)
            if donor.exists() is False:
                return Response({'message': 'Donor not found'}, status=status.HTTP_404_NOT_FOUND)
            
            donor = donor.first()
            
            if donor.active_donation_request is not None:
                active_request = DonationRequest.objects.get(request_id = donor.active_donation_request.request_id)
                
                serializer = DonationRequestSerializer(active_request)
                return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
            
            # TODO: Filter conditions --> must be within 3km radius
            permissible_blood_groups = BLOOD_GROUPS_MAPPER[donor.blood_group]
            
            donation_requests = DonationRequest.objects.filter(blood_group__in=permissible_blood_groups).filter(current_status='pending').exclude(requested_by=donor.user)
            
            serializer = DonationRequestSerializer(donation_requests, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response({'message': 'Something went wrong'}, status=status.HTTP_400_BAD_REQUEST)    
        
        
class DonorHistory(APIView):
    def post(self, request):
        try:    
            data = request.data
            donor_id = data['donor_id']
            donor = Donor.objects.filter(id=donor_id)
            if donor.exists() is False:
                return Response({'message': 'Donor not found'}, status=status.HTTP_404_NOT_FOUND)
            donation_request = DonationRequest.objects.filter(donor_id = donor_id)
            serializer = DonationRequestSerializer(donation_request, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)        
        except Exception as e:
            print(e)
            return Response({"message":"Something went wrong"},status=status.HTTP_400_BAD_REQUEST)
              
class ReceiverDonationRequestHistoryView(APIView):
    def post(self,request):
        try:
            data = request.data
            requested_by = data['requested_by']
            user = User.objects.filter(id=requested_by)
            if user.exists() is False:
                return Response({'message':'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
            donation_request = DonationRequest.objects.filter(requested_by=requested_by) 
            serializer = DonationRequestSerializer(donation_request, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)        
        except Exception as e:
            print(e)
            return Response({"message":"Something went wrong"},status=status.HTTP_400_BAD_REQUEST)