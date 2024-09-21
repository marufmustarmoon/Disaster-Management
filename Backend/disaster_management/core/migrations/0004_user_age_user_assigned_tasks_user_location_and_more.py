# Generated by Django 5.1.1 on 2024-09-19 18:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_remove_crisis_added_by_crisis_timestamp'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='age',
            field=models.IntegerField(default=30),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='user',
            name='assigned_tasks',
            field=models.ManyToManyField(blank=True, null=True, related_name='volunteers', to='core.task'),
        ),
        migrations.AddField(
            model_name='user',
            name='location',
            field=models.CharField(choices=[('dhaka', 'Dhaka'), ('chittagong', 'Chittagong'), ('sylhet', 'Sylhet'), ('rajshahi', 'Rajshahi'), ('khulna', 'Khulna'), ('barisal', 'Barisal'), ('rangpur', 'Rangpur')], default='dhaka', max_length=20),
        ),
        migrations.AddField(
            model_name='user',
            name='mobile_number',
            field=models.CharField(default=30, max_length=20),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='Volunteer',
        ),
    ]
