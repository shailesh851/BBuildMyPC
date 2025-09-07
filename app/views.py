
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from app.models import Product,SelectedProducts,Add_to_Cart
import json
from django.http.response import JsonResponse








# @api_view(["GET"])
# def handle1(request):
#     url = 'https://www.pcstudio.in/shop/page/106/'
#     headers = {
#         'User-Agent': 'Mozilla/5.0'
#     }

#     response = requests.get(url, headers=headers)
#     if response.status_code != 200:
#         return Response({"error": "Failed to fetch the webpage."}, status=500)

#     soup = BeautifulSoup(response.text, 'html.parser')
#     products = soup.find_all("li", class_="entry")

#     saved_count = 0

#     for product in products:
#         # Product title
#         title_tag = product.select_one(".woo-product-info .title a span")
#         title = title_tag.get("title") if title_tag else "N/A"

#         # Image URL
#         image_tag = product.select_one("img.woo-entry-image-main")
#         img_url = image_tag["src"] if image_tag else "N/A"

#         # Price (original and discounted)
#         price_container = product.select_one(".price-wrap")
#         if price_container:
#             original_price_tag = price_container.find("del")
#             discounted_price_tag = price_container.find("ins")
#             original_price = original_price_tag.text.strip() if original_price_tag else "N/A"
#             discounted_price = discounted_price_tag.text.strip() if discounted_price_tag else "N/A"
#         else:
#             original_price = discounted_price = "N/A"

#         # Brand and Product Type
#         categories = product.select(".woo-product-info .category a")
#         category_list = [c.text.strip() for c in categories]
#         brand = category_list[0] if len(category_list) > 0 else "N/A"
#         product_type = category_list[1] if len(category_list) > 1 else "N/A"

#         # Save if not already present
#         if not Product.objects.filter(title=title).exists():
#             Product.objects.create(
#                 title=title,
#                 image_url=img_url,
#                 brand=brand,
#                 type=product_type,
#                 original_price=original_price,
#                 discounted_price=discounted_price
#             )
#             saved_count += 1

#     return Response({"message": f"✅ Page 106 scraped. {saved_count} new products saved."})

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.conf import settings
import google.generativeai as genai
from django.shortcuts import render




@api_view(["GET"])
def product_list(request):
    products = Product.objects.all().values()  # returns QuerySet of dicts
    product_list = list(products)  # convert QuerySet to list
    return Response({'products': product_list})

@api_view(["POST"])
def fill_selected_data(request):
    try:
        # Extract fields from POST data
        title = request.data.get("title")
        image_url = request.data.get("image_url")
        brand = request.data.get("brand")
        type = request.data.get("type")  # avoid using 'type' (Python reserved word)
        original_price = request.data.get("original_price")
        discounted_price = request.data.get("discounted_price")

        # Check if a product with the same type exists
        existing = SelectedProducts.objects.filter(type=type).first()

        if existing:
            # Update existing entry
            existing.title = title
            existing.image_url = image_url
            existing.brand = brand
            existing.original_price = original_price
            existing.discounted_price = discounted_price
            existing.save()
            return Response({"message": f"Product of type '{type}' updated successfully!"}, status=200)
        else:
            # Create new entry
            SelectedProducts.objects.create(
                title=title,
                image_url=image_url,
                brand=brand,
                type=type,
                original_price=original_price,
                discounted_price=discounted_price
            )
            return Response({"message": "New product saved successfully!"}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)




@api_view(["GET"])
def selected_product_of_PCbuild(request):
    selected_products = SelectedProducts.objects.all().values() # returns QuerySet of dicts
    product_list = list(selected_products)  # convert QuerySet to list
    return Response({'selected_products': product_list})

@api_view(['DELETE'])
def remove_selected_product(request, product_id):
    try:
        product = SelectedProducts.objects.get(id=product_id)
        product.delete()
        return Response({"success": True, "message": "Product removed"})
    except SelectedProducts.DoesNotExist:
        return Response({"success": False, "message": "Product not found"}, status=404)
    
    




# Configure the Gemini API with your key from settings.py
genai.configure(api_key=settings.GOOGLE_API_KEY)

# Initialize the generative model (or you can do this in the view)
model = genai.GenerativeModel('gemini-1.5-flash')
chat = model.start_chat(history=[])

@api_view(['POST'])
def chatbot_view(request):
    # This block handles the POST request from the JavaScript
    
        
        user_message = request.data.get("prompt")
        
        # Send the user's message to the Gemini chat model
        print(user_message)
        response = chat.send_message(user_message)
        bot_reply = response.text
        
        # Return the AI's reply as a JSON response
        return Response({"reply": bot_reply})
    
    # This block handles the initial GET request to load the page

    # Optional: A generic response for other methods (e.g., PUT, DELETE)



#"C:\Users\Deepak\OneDrive\Desktop\Grand Theft Auto V.url"

@api_view(['POST'])
def Add_Cart(request):
    user_message = request.data.get("status_msg")

    if user_message == "ADD":
        selected_products = SelectedProducts.objects.all()

        for product in selected_products:
            Add_to_Cart.objects.create(
                title=product.title,
                image_url=product.image_url,
                brand=product.brand,
                type=product.type,
                original_price=product.original_price,
                discounted_price=product.discounted_price,
            )

        return Response({"message": "Products added to cart successfully"})

    elif user_message == "REMOVE":
        SelectedProducts.objects.all().delete()
        return Response({"message": "Selected products removed successfully"})

    return Response({"message": "Invalid status_msg"}, status=400)




@api_view(["GET"])
def cart_product_list(request):
    products1 = Add_to_Cart.objects.all().values()  # returns QuerySet of dicts
    product_list1 = list(products1)  # convert QuerySet to list
    return Response({'products1': product_list1})



@api_view(["POST"])
def add_to_cart(request):
    try:
        # Extract fields from POST data
        title = request.data.get("title")
        image_url = request.data.get("image_url")
        brand = request.data.get("brand")
        type = request.data.get("type")  # avoid using 'type' (Python reserved word)
        original_price = request.data.get("original_price")
        discounted_price = request.data.get("discounted_price")

        # Check if a product with the same type exists
       
        Add_to_Cart.objects.create(
                title=title,
                image_url=image_url,
                brand=brand,
                type=type,
                original_price=original_price,
                discounted_price=discounted_price
        )
        return Response({"message": "New product Added in Cart successfully!"}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
# views.py


@api_view(['DELETE'])
def delete_cart_product(request, pk):
    try:
        product =Add_to_Cart.objects.get(pk=pk)
        product.delete()
        return Response({'message': 'Deleted successfully'}, status=204)
    except Add_to_Cart.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
