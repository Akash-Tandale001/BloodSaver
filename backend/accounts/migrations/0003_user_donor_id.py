# Generated by Django 4.2.2 on 2023-07-09 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_remove_user_donor_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='donor_id',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
