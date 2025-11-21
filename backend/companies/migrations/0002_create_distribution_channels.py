# Generated manually to replace Company with DistributionChannel

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Step 1: Create new DistributionChannel model
        migrations.CreateModel(
            name='DistributionChannel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('code', models.CharField(max_length=50, unique=True)),
                ('channel_type', models.CharField(choices=[('headoffice', 'Head Office'), ('branch', 'Branch'), ('agents', 'Agents')], max_length=20)),
                ('address', models.TextField(blank=True)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Distribution Channel',
                'verbose_name_plural': 'Distribution Channels',
            },
        ),
        
        # Step 2: Create new DistributionChannelMembership model
        migrations.CreateModel(
            name='DistributionChannelMembership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(blank=True, max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('channel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='memberships', to='companies.distributionchannel')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='channel_memberships', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Distribution Channel Membership',
                'verbose_name_plural': 'Distribution Channel Memberships',
                'unique_together': {('user', 'channel')},
            },
        ),
        
        # Step 3: Delete old models (this will cascade delete related data)
        migrations.DeleteModel(
            name='CompanyMembership',
        ),
        migrations.DeleteModel(
            name='Company',
        ),
    ]
