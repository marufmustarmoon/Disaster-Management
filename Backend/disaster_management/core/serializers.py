from rest_framework import serializers
from .models import User, Donation, Crisis, InventoryItem, Task,Respond

from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role']



    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data['role']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid login credentials")
        return {"user": user}

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'age','location','assigned_tasks', 'role', 'mobile_number']

# Donation Serializer
class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ['amount', 'donor_name', 'timestamp']

class RespondSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.username', read_only=True)
    class Meta:
        model = Respond
        fields = ['id', 'volunteer_name', 'message', 'responded_at'] 


# Crisis Serializer
class CrisisSerializer(serializers.ModelSerializer):
    responses = RespondSerializer(many=True, read_only=True)
    class Meta:
        model = Crisis
        fields = ['id', 'title', 'location', 'description', 'severity', 'status', 'image', 'required_help', 'created_by', 'timestamp','responses']

# Inventory Serializer
class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'item_name', 'quantity', 'item_type','expense', 'added_by', 'timestamp']




        


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id','title', 'description', 'status', 'created_at', 'updated_at']