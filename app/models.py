from django.db import models

class Product(models.Model):
    title = models.CharField(max_length=300)
    image_url = models.URLField()
    brand = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    original_price = models.CharField(max_length=50)
    discounted_price = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class SelectedProducts(models.Model):
    title = models.CharField(max_length=300)
    image_url = models.URLField()
    brand = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    original_price = models.CharField(max_length=50)
    discounted_price = models.CharField(max_length=50)

    def __str__(self):
        return self.title
    
    
    
    
class Add_to_Cart(models.Model):
    title = models.CharField(max_length=300)
    image_url = models.URLField()
    brand = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    original_price = models.CharField(max_length=50)
    discounted_price = models.CharField(max_length=50)

    def __str__(self):
        return self.title