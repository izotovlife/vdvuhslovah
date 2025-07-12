#C:\Users\ASUS Vivobook\PycharmProjects\PythonProject1\vdvuhslovah\core\apps.py

from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import core.signals  # noqa

# dummy update

# updated 2025-07-12 11:27:40

# updated 2025-07-12 11:31:56
