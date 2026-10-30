export function toUserResponse(user) {
    return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    };
}
