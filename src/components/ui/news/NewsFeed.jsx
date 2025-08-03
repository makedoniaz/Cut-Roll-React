import NewsCard from "./NewsCard"
import SectionHeading from '../common/SectionHeading';

const NewsFeed = () => {
  // Sample data - replace with your actual data source
  const newsItems = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=300&fit=crop",
      category: "High On Films",
      categoryIcon: "🎬",
      title: "10 Movies Like 12 Angry Men That You Should Watch",
      description: "12 Angry Men is an all-weather film. The classic is one of those rare pieces that can be seen on any day, in any mood, and the result will not be disappointing. Sidney Lumet's legal juggernaut is born out of the jury's deliberations on the question of convicting a minor for murder. Requiring a unanimous decision, one juror's hold out unfurls the dynamism of reasonable doubt in criminal law while exposing American society from the lens of race, class, and social prejudices.",
      hasVideo: false
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=300&fit=crop",
      category: "UQ Film Appreciation Society",
      categoryIcon: "🎭",
      title: "UQFAS 'Majors as Movies' Review Series: Blade Runner",
      description: "On the 29th of July, UQFAS kicked off our Semester 2 theme, 'Majors as Movies', with a screening of Ridley Scott's seminal 1982 sci-fi noir film, Blade Runner. Inspired by UQ's Bachelors of IT and Computer Science. The film itself has had an enormous legacy, positive and negative, spanning in scope from technical advancements to inspiring a whole new genre of science fiction, and our post film discussion touched upon many of these aspects, including several of Blade Runner's more controversial elements.",
      hasVideo: false
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=500&h=300&fit=crop",
      category: "Grosvenor Picture Theatre",
      categoryIcon: "🏛️",
      title: "The Legend of Ochi: A Return to Handcrafted Cinema",
      description: "In an era dominated by CGI, a new fantasy film from A24, 'The Legend of Ochi,' is making a powerful case for a return to handcrafted filmmaking. Directed by Isaiah Saxon, this family-friendly adventure film is a visual feast that uses practical effects, puppetry, and animatronics to create a world that feels both magical and real. While many modern blockbusters rely on computer-generated imagery to create fantastical creatures and environments, 'The Legend of Ochi' stands out by prioritizing tangible, on-set magic.",
      hasVideo: false
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&h=300&fit=crop",
      category: "Golden Age Cinema and Bar",
      categoryIcon: "🎞️",
      title: "Michael Haneke: Depicting Our Worst Impulses",
      description: "Michael Haneke's films are not for the faint of heart. The Austrian director has built a career on unflinching examinations of violence, cruelty, and the darker aspects of human nature. His work challenges audiences to confront uncomfortable truths about themselves and society at large.",
      hasVideo: false
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=300&fit=crop",
      category: "UoA Film Society",
      categoryIcon: "😊",
      title: "Finding Joy in Cinema: A Celebration of Feel-Good Films",
      description: "In a world that often feels heavy with bad news, sometimes we need cinema that lifts our spirits and reminds us of life's simple pleasures. This week, the UoA Film Society explores the power of feel-good films and their importance in the cinematic landscape.",
      hasVideo: false
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=500&h=300&fit=crop",
      category: "Drexel Theatre",
      categoryIcon: "🎭",
      title: "Beyond the Laughter: The Art of Dark Comedy",
      description: "Dark comedy walks a tightrope between humor and horror, finding laughter in life's most uncomfortable moments. The Drexel Theatre's latest retrospective examines how filmmakers use this genre to explore serious themes while keeping audiences engaged through humor.",
      hasVideo: true
    }
  ];

  const handleReadMore = (id) => {
    console.log(`Reading more about story ${id}`);
    // Implement your navigation logic here
  };

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="mx-auto py-8">
        <SectionHeading heading="RECENT STORIES"/>
        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <NewsCard
              key={item.id}
              image={item.image}
              category={item.category}
              categoryIcon={item.categoryIcon}
              title={item.title}
              description={item.description}
              hasVideo={item.hasVideo}
              onReadMore={() => handleReadMore(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;