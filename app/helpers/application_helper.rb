module ApplicationHelper
  def resource_name
    :user
  end

  def resource_class
    User
  end

  def resource
    @resource ||= User.new
  end

  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end

  def og_title(title = "Livle : Life is live")
    "<meta property='og:title' content='#{title}'>"
  end

  def og_description(desc = '라이블은 라이브 음악을 쉽고 재밌게 즐기는 방법을 제공하는 라이브 음악 플랫폼입니다.
    질좋은 라이브 음악 영상을 감상하고 콘서트 티켓을 쉽게 구매할 수 있습니다.')
    "<meta property='og:description' content='#{desc}'>"
  end

  def og_image(url)
    unless url
      url = "#{request.base_url}/logo_og.jpg"
    end
    "<meta property='og:image' content='#{url}'>"
  end

  def opengraph(content)
    if content.class == Feed
      content_for :opengraph, "#{og_title(content.title)}
      #{og_description(content.content)}
      #{og_image(get_full_url_from_id(content.youtube_id))}".html_safe
    elsif content.class == Upcoming
      content_for :opengraph, "#{og_title(content.title)}
      #{og_description}
      #{og_image(content.main_video ? get_full_url_from_id(content.main_video.youtube_id) : content.image_url)}".html_safe
    end
  end

  def yield_opengraph
    content_for?(:opengraph) ? content_for(:opengraph) : "#{og_title}
    #{og_description}
    #{og_image(nil)}".html_safe
  end

  def thumbnail_tag(youtube_id, options = {})
    return "<div
    class='youtube-thumbnail #{options[:class] if options[:class]}
    #{'loaded' if youtube_id.length == 0}'
    #{'id = ' + options[:id] if options[:id]}
    data-youtube-id='#{youtube_id}'
     style='#{options[:style] if options[:style]} #{"background-image: '#{asset_url('thumbnail_livle_wide')}'" if options[:wide]}'></div>".html_safe
  end

  def raw_text(text, options = {})
    if text
      context = text.gsub(/\n/, '<br />')
      result = "<p class='#{options[:class] if options[:class]}'
        id='#{options[:id] if options[:id]}'>"+context+'</p>'
      result.html_safe
    end
  end

  def get_youtube_video_id(youtube_video_url)
    youtube_video_url ? youtube_video_url.gsub(/https:\/\/www.youtube.com\/watch\?v=|https:\/\/youtu.be\//, '') : ''
  end

  private

  def get_full_url_from_id(youtube_id)
    "https://www.youtube.com/watch?v=#{youtube_id}"
  end
end
