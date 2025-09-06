
from django.contrib import admin
from .models import Product
from .models import SelectedProducts

admin.site.register(Product)
admin.site.register(SelectedProducts)
