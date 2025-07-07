from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, PincodeData


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'phone_number', 'address', 'pincode', 'city', 'country',
            'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        """
        Validate password confirmation
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return attrs
    
    def create(self, validated_data):
        """
        Create user with encrypted password
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """
        Validate user credentials
        """
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if user:
                if user.is_active:
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError("User account is disabled")
            else:
                raise serializers.ValidationError("Invalid email or password")
        else:
            raise serializers.ValidationError("Must provide email and password")


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'address', 'pincode', 'city', 'country',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class PincodeDataSerializer(serializers.ModelSerializer):
    """
    Serializer for pincode data
    """
    class Meta:
        model = PincodeData
        fields = ['pincode', 'city', 'state', 'country']