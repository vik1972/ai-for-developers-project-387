# Seed data for the application
owner = Owner.find_or_create_by!(email: 'owner@example.com') do |o|
  o.name = 'Calendar Owner'
  o.slug = 'calendar-owner'
  o.bio = 'Демо-профиль для бронирования встреч'
  o.is_public = true
end

# Ensure slug and name are correct even if owner already existed
owner.update!(
  slug: 'calendar-owner',
  name: 'Calendar Owner',
  bio: 'Демо-профиль для бронирования встреч',
  is_public: true
) if owner.slug != 'calendar-owner'

Event.find_or_create_by!(name: 'Консультация') do |e|
  e.description = 'Индивидуальная консультация по вашему вопросу'
  e.duration = 30
  e.owner = owner
end

Event.find_or_create_by!(name: 'Встреча') do |e|
  e.description = 'Командная встреча для обсуждения проекта'
  e.duration = 60
  e.owner = owner
end

Event.find_or_create_by!(name: 'Собеседование') do |e|
  e.description = 'Техническое собеседование'
  e.duration = 45
  e.owner = owner
end
