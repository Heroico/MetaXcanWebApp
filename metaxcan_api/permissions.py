__author__ = 'heroico'

from rest_framework import permissions

class AuthenticatedOwnerPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        has_permission = request.user and request.user.is_authenticated() and obj.owner == request.user
        return has_permission

class AuthenticatedUserPermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        has_permission = request.user and request.user.is_authenticated() and obj == request.user
        return has_permission
