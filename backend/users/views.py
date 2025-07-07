from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db import IntegrityError
from .models import User, PincodeData
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, 
    UserSerializer, PincodeDataSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    View for user registration
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Create authentication token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
            
        except IntegrityError as e:
            return Response({
                'error': 'User with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    View for user login
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    View for user logout
    """
    try:
        # Delete the user's token
        token = Token.objects.get(user=request.user)
        token.delete()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Token.DoesNotExist:
        return Response({
            'error': 'Token not found'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View for user profile (get and update)
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([AllowAny])
def pincode_lookup(request, pincode):
    """
    View to lookup city and country by pincode
    """
    from .services import PincodeService
    
    service = PincodeService()
    result = service.lookup_pincode(pincode)
    
    if result['success']:
        return Response(result['data'], status=status.HTTP_200_OK)
    else:
        return Response({
            'error': result.get('error', 'Pincode not found')
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """
    View to list all users (for admin purposes)
    """
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
