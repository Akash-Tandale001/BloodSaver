from django.urls import path
import uuid
from .views import *

urlpatterns = [
    path('request/',DonationRequestView.as_view()),
    path('pending-request-list/', PendingDonationsListView.as_view()),
    path('donation-status-update/<str:pk>/',DonationStatusUpdate.as_view()),
    path('donor-history/',DonorHistory.as_view()),
    path('receiver-history/',ReceiverDonationRequestHistoryView.as_view()),

]