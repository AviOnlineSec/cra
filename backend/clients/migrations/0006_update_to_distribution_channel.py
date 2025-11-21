# Generated manually to update Client to use DistributionChannel

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0005_alter_client_distributionchannel'),
        ('companies', '0002_create_distribution_channels'),
    ]

    operations = [
        # Rename the CharField to old name to avoid conflicts
        migrations.RenameField(
            model_name='client',
            old_name='distributionChannel',
            new_name='distributionChannel_old',
        ),
        # Add new distribution_channel ForeignKey field
        migrations.AddField(
            model_name='client',
            name='distribution_channel',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='clients', 
                to='companies.distributionchannel'
            ),
        ),
    ]
