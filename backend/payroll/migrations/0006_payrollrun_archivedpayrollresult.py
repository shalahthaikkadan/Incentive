# Generated by Django 5.2.3 on 2025-07-03 06:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payroll', '0005_component_attachment_component_created_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PayrollRun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('run_timestamp', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-run_timestamp'],
            },
        ),
        migrations.CreateModel(
            name='ArchivedPayrollResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(max_length=50)),
                ('employee_name', models.CharField(blank=True, max_length=100, null=True)),
                ('base_salary', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('total_incentives', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total_deductions', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('final_salary', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(max_length=10)),
                ('rejection_reason', models.TextField(blank=True, null=True)),
                ('components_snapshot', models.JSONField(default=dict)),
                ('run', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='archived_results', to='payroll.payrollrun')),
            ],
        ),
    ]
