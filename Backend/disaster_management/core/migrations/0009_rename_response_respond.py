# Generated by Django 5.1.1 on 2024-09-22 19:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_alter_user_assigned_tasks_response'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Response',
            new_name='Respond',
        ),
    ]
