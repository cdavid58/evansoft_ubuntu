from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', include('home.urls')),
    path('inventory/', include('inventory.urls')),
    path('invoice/', include('invoice.urls')),
    path('customer/', include('customer.urls')),
    path('supplier/', include('supplier.urls')),
    path('shopping/', include('shopping.urls')),
    path('setting/', include('setting.urls')),
    path('employee/', include('employee.urls')),
    path('wallet/', include('wallet.urls')),
    path('novelty/', include('novelty.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
