"""
URL configuration for admission project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/products/", views.product_list, name="product-list"),
    path("selected_product_of_PCbuild/", views.selected_product_of_PCbuild, name="selected_product_of_PCbuild"),
    path('api/selected-parts/', views.fill_selected_data),
    path('remove_selected_product/<int:product_id>/', views.remove_selected_product, name='remove_selected_product'),
    path("chatbot/", views.chatbot_view, name="chatbot"),
    path("Add_Cart/", views.Add_Cart, name="Add_Cart"),
    path("cart_product_list/", views.cart_product_list, name="cart_product_list"),
    path("add_to_cart/", views.add_to_cart, name="add_to_cart"),
    path('delete_cart_product/<int:pk>/', views.delete_cart_product, name='delete_cart_product'),
    
]
