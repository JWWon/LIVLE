class Curation < ArtistsRecord
  searchkick callbacks: :async, word_middle: [:artists_names, :title]
  belongs_to :user
  has_many :curation_artists
  has_many :artists, through: :curation_artists
  has_many :curation_likes
  has_many :curation_comments

  def video_id
    get_youtube_video_id(youtube_id)
  end
end
