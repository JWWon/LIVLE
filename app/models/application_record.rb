class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # 이렇게 하면 isolation 버그남
  # def increase_count_view
  #   self.count_view += 1
  #   self.save
  # end

  # only for FeedLike and UpcomingLike classes
  def self.toggle_like(post, user)
    post_class_name = post.class.name.downcase # curation
    post_field_sym = "#{post_class_name}_id".to_sym # :curation_id
    like = self.where("#{post_class_name}_id = ? AND user_id = ?", post.id, user.id).take
    if like
      like.destroy
      return false
    else
      like = self.new
      like[post_field_sym] = post.id
      like.user_id = user.id
      like.save
      return true
    end
  end
end
