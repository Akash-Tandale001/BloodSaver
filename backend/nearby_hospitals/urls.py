from django.urls import path
from .views import *

urlpatterns = [
    path('<int:pk>/',Nearby_Hospital.as_view()),
]