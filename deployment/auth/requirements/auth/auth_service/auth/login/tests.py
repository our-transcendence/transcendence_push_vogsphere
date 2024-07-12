# import json
# from django.test import TestCase, RequestFactory
# from login.models import User
# from login.endpoints.register_login import register_endpoint

# # Create your tests here.

# class register_Test(TestCase):
#     def setUp(self):
#         pass

#     def test_empty_json(self):
#         json_data = {}
#         response = self.client.post('/register/',
#                                     json.dumps(json_data),
#                                     content_type="application/json")
#         self.assertIn(response.status_code, [400, 401])

#     def test_int_in_field(self):
#         json_data = {
#             "login": 4,
#             "password": 5,
#             "display_name": 5
#         }
#         response = self.client.post('/register/',
#                                     json.dumps(json_data),
#                                     content_type="application/json")
#         self.assertIn(response.status_code, [400, 401])

#     def test_


from django.test import TestCase, RequestFactory
from unittest.mock import patch
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseForbidden
from django.core.exceptions import ValidationError
import requests
from login.endpoints.register_login import register_endpoint
from login.utils import send_new_user, send_user_to_history_service, send_user_to_stats_service, send_user_to_user_service
from login.models import User
import json

class RegisterEndpointTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def mock_return_refresh_token(self, user):
        return HttpResponse(status=200)

    def mock_send_new_user_valid(self, user, user_data):
        return HttpResponse(status=200)

    def mock_return_refresh_token(self, user):
        return HttpResponse(status=200)

    def mock_send_new_user_error(self, user, user_data):
        return HttpResponse(status=500)

    def mock_send_user_to_user_service(self, user, user_data, headers):
        return HttpResponse(status=200)

    def mock_send_user_to_stats_service(self, user, user_data, headers):
        return HttpResponse(status=200)

    def mock_send_user_to_history_service(self, user, user_data, headers):
        return HttpResponse(status=200)

    def mock_user_service_404(self, user, user_data, headers):
        return HttpResponse(status=404)

    @patch('login.endpoints.register_login.send_new_user')
    @patch('login.endpoints.register_login.return_refresh_token')
    def test_successful_registration(self, mock_send_new_user, mock_return_refresh_token):
        mock_send_new_user.side_effect = self.mock_send_new_user_valid
        mock_return_refresh_token.side_effect = self.mock_return_refresh_token

        request = self.factory.post('/register/', json.dumps({
            'login': 'testuser',
            'password': 'verysecurepassword',
            'display_name': 'Test User'
        }), content_type='application/json')
        response = register_endpoint(request)
        self.assertEqual(response.status_code, 200)  # Assuming 200 OK for success

    @patch('login.utils.send_user_to_user_service')
    @patch('login.utils.send_user_to_stats_service')
    @patch('login.utils.send_user_to_history_service')
    @patch('login.endpoints.register_login.return_refresh_token')
    def test_registration_user404(self, mock_user_service_404, mock_send_user_to_stats_service, mock_send_user_to_history_service, mock_return_refresh_token):
        mock_user_service_404.side_effect = self.mock_user_service_404
        mock_send_user_to_stats_service.side_effect = self.mock_send_user_to_stats_service
        mock_send_user_to_history_service.side_effect = self.mock_send_user_to_history_service
        mock_return_refresh_token.side_effect = self.mock_return_refresh_token

        request = self.factory.post('/register/', json.dumps({
            'login': 'testuser',
            'password': 'verysecurepassword',
            'display_name': 'Test User'
        }), content_type='application/json')
        response = register_endpoint(request)
        self.assertNotEqual(response.status_code, 200)  # Assuming 200 OK for success

    def test_int_in_json(self):
        request = self.factory.post('/register/', json.dumps({
            'login': 4,
            'password': 5,
            'display_name': 5
        }), content_type='application/json')
        response = register_endpoint(request)
        self.assertIsInstance(response, HttpResponseBadRequest)

    def test_invalid_json_payload(self):
        request = self.factory.post('/register/', 'invalid json', content_type='application/json')
        response = register_endpoint(request)
        self.assertIsInstance(response, HttpResponseBadRequest)

    def test_missing_required_fields(self):
        request = self.factory.post('/register/', json.dumps({'login': 'testuser'}), content_type='application/json')
        response = register_endpoint(request)
        self.assertIsInstance(response, HttpResponseBadRequest)

    def test_short_password(self):
        request = self.factory.post('/register/', json.dumps({
            'login': 'testuser',
            'password': '1234',
            'display_name': 'Test User'
        }), content_type='application/json')
        response = register_endpoint(request)
        self.assertIsInstance(response, HttpResponseBadRequest)

    def test_duplicate_login(self):
        # First create a user
        User.objects.create(login='existinguser', password='password')

        # Then attempt to register another user with the same login
        request = self.factory.post('/register/', json.dumps({
            'login': 'existinguser',
            'password': 'anotherpassword',
            'display_name': 'Another User'
        }), content_type='application/json')
        response = register_endpoint(request)
        self.assertIsInstance(response, HttpResponseForbidden)
