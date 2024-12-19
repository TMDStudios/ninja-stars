from pathlib import Path
from dotenv.main import load_dotenv
import os
from datetime import timedelta

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ['SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'users',
    'base',
    'frontend',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Disable CSRF for APIs specifically
if 'django.middleware.csrf.CsrfViewMiddleware' in MIDDLEWARE:
    MIDDLEWARE.remove('django.middleware.csrf.CsrfViewMiddleware')

ROOT_URLCONF = 'ninja_stars.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ninja_stars.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_URL = 'frontend:login'
LOGIN_REDIRECT_URL = 'frontend:home'
LOGOUT_REDIRECT_URL = 'frontend:home'

AUTH_USER_MODEL = 'users.CustomUser'

# Session cookie settings
# Ensures that the session cookie is only sent over HTTPS (should be enabled for production)
SESSION_COOKIE_SECURE = True

# Prevents JavaScript from accessing the session cookie (helps mitigate XSS attacks)
SESSION_COOKIE_HTTPONLY = True

# Sets the age of session cookies (in seconds), here set to 30 minutes (1800 seconds)
SESSION_COOKIE_AGE = 1800  # 30 minutes

# This ensures that the session will expire if the user is inactive for more than SESSION_COOKIE_AGE
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

# Set this to True to invalidate old sessions on login
SESSION_SAVE_EVERY_REQUEST = True

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow anyone to access the API by default
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',  # For session-based authentication
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # JWT Authentication globally
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Set the expiration for access tokens
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # Set the expiration for refresh tokens
    'ROTATE_REFRESH_TOKENS': False,  # Whether to rotate refresh tokens
    'BLACKLIST_AFTER_ROTATION': True,  # Whether to blacklist tokens after rotation
    'ALGORITHM': 'HS256',  # Algorithm to use for encoding tokens
    'SIGNING_KEY': SECRET_KEY,  # Change to a new key later
    'AUTH_HEADER_TYPES': ('Bearer',),  # Set the auth header type to use Bearer tokens
    'USER_ID_FIELD': 'id',  # The field in the user model to identify the user
    'USER_ID_CLAIM': 'user_id',  # The claim name to store the user ID in the token
}

CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = True
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')