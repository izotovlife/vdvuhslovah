#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\apps.py

from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals  # noqa

# updated 2025-07-12 22:40:59

# updated 2025-07-12 23:07:08

# updated 2025-07-13 21:53:56
