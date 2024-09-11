from django.test import TestCase
from .models import Room

class RoomModelTest(TestCase):
    def test_create_room(self):
        # Create a Room object and save it to the database
        room = Room.objects.create(name="Test Room", slug="test-room")

        # Retrieve the room from the database
        saved_room = Room.objects.get(slug="test-room")

        # Assert that the room was saved correctly
        self.assertEqual(saved_room.name, "Test Room")
        self.assertEqual(saved_room.slug, "test-room")
