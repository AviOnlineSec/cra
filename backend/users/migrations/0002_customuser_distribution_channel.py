# Generated migration for distribution_channel field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='distribution_channel',
            field=models.CharField(
                blank=True,
                choices=[('HeadOffice', 'Head Office'), ('Branch', 'Branch'), ('Agent', 'Agent')],
                max_length=20,
                null=True
            ),
        ),
    ]
