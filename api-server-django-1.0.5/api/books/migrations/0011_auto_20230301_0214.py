# Generated by Django 3.2.13 on 2023-02-28 17:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_books', '0010_books_is_ads'),
    ]

    operations = [
        migrations.AddField(
            model_name='books',
            name='bm_listdata',
            field=models.JSONField(default=[]),
        ),
        migrations.DeleteModel(
            name='Bookmarks',
        ),
    ]
