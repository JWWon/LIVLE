# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

for i in 1..5
  User.create(provider: "local", token: "", nickname: Faker::HarryPotter.character, profile_img: "image_profile.jpeg")
end

for i in 1..5
  Artist.create(name: Faker::Book.author, image_url: "image_artist.jpg")
end

for i in 1..5
  curation = Curation.create(user_id: rand(1..5), title: Faker::Demographic.race, content: Faker::Hacker.say_something_smart, count_share: rand(1..100), count_view: rand(1..100))
  for i in 1..5
    CurationVideo.create(curation: curation.id, artist_id: rand(1..5), youtube_id: "https://youtu.be/Xvjnoagk6GU")
    CurationLike.create(curation: curation.id, user_id: rand(1..5))
    CurationComment.create(curation_id: curation.id, user_id: rand(1..5), content: Faker::Hacker.say_something_smart)
  end
end

for i in 1..5
  feed = Feed.create(user_id: rand(1..5), title: Faker::Demographic.race, youtube_id: "https://youtu.be/Xvjnoagk6GU", count_view: rand(1..5), count_share: rand(1..5))
  for i in 1..5
    FeedComment.create(feed_id: feed.id, user_id: rand(1..5), content: Faker::Hacker.say_something_smart)
    FeedArtist.create(feed_id: feed.id, artist_id: rand(1..5))
    FeedLike.create(feed_id: feed.id, user_id: rand(1..5))
  end
end

for i in 1..5
  upcoming = Upcoming.create(title: Faker::Space.agency, place: Faker::Space.galaxy, start_date: Date.new(2017,rand(1..12),rand(1..12)), end_date: Date.new(2017,rand(1..12),rand(1..12)), ticket_url: 'www.naver.com', count_view: rand(1..100), count_share: rand(1..100))
  for i in 1..5
    UpcomingArtist.create(upcoming_id: upcoming.id, artist_id: rand(1..5))
    UpcomingComment.create(upcoming_id: upcoming.id, user_id: rand(1..5), content: Faker::Hacker.say_something_smart)
    UpcomingLike.create(upcoming_id: upcoming.id, user_id: rand(1..5))
  end
end
