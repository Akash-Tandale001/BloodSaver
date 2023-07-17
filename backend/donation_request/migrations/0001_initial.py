# Generated by Django 4.2.2 on 2023-07-09 08:52

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DonationRequest',
            fields=[
                ('request_id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('phone_number', models.CharField(max_length=10)),
                ('blood_group', models.CharField(max_length=10)),
                ('required_on', models.DateTimeField()),
                ('place_of_donation', models.CharField(max_length=50)),
                ('units_required', models.IntegerField()),
                ('reason', models.CharField(blank=True, max_length=250, null=True)),
                ('type_of_donation', models.CharField(choices=[('blood', 'BLOOD'), ('plasma', 'PLASMA')], default='blood', max_length=7)),
                ('is_urgent', models.BooleanField(default=False)),
                ('is_fullfiled', models.BooleanField(default=False)),
                ('current_status', models.CharField(choices=[('active', 'ACTIVE'), ('pending', 'PENDING'), ('fullfilled', 'FULLFILLED'), ('cancelled', 'CANCELLED')], default='pending', max_length=20)),
                ('coordinates', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, to='accounts.coordinate')),
            ],
        ),
    ]
