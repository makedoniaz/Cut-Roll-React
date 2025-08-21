import { useState } from "react";

function ArticlePage({ title, date, imageUrl, content }) {
    const [copied, setCopied] = useState(false);

  // Используем шаблонные тексты
  const sampleTitle = "Sneak Auswertung 17.08 - Jane Austen und das Chaos in meinem Leben";
  const sampleDate = "August 18, 2025";
  const sampleImageUrl = "https://a.ltrbxd.com/resized/story/image/2/2/2/1/6/2/9/9/shard/45630/image-rhzqzktq-960-960-0-0-fill.jpg?v=2066dbad19";
  const sampleContent = `Gestern lief in unserer Sneak Preview "Jane Austen und das Chaos in meinem Leben". Ihr habt die französische Komödie mit 5,88 Punkten Schnitt eher mittelmäßig bewertet.

Hier ein Best of der Kommentare: 

"war mit Sicherheit nicht der beste und tiefgründigste Film meines Lebens, aber hat Spaß gemacht, war leicht und lustig und herrlich französisch" (8)
"Schöne Szenerie, eher klischee Handlung" (8)
"Sehr süß" (8)
"Hat den französischen und britischen Humor charmant verbunden" (7)
"wusste gar nicht, dass französisch so witzig sein kann, seichte Unterhaltung, Kind of literarisch" (6)
"schöne Bilder, schöne Musik, allerdings recht vorhersehbar" (6)
"nur der französische Film kann sich selbst aus Versehen und Stolz und Vorurteil mit voller Absicht parodieren, ohne völlig lächerlich zu sein" (6)
"Porträt einer jungen Frau in Langeweile" (4)
"Hofen sind eh überbewertet" (3)
"Kaffee & Kuchen Pt.2, aber was war mit ihrer Phobie?" (3)
"Dass so ein banaler, klischeehafter Film den Namen "Jane Austen" im Titel trägt, ist eine Beleidigung" (2)

Diesen Sonntag läuft ein Film entweder in Engl. OmU oder Deutsch OmeU!.

Aliquam erat volutpat. Sed ut dui ut lacus dictum fermentum vel tincidunt neque. 
Sed sed lacinia lectus.`;

        const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // уведомление исчезает через 2 сек
    });
};

    return (
      <div className="mx-auto px-4 py-8 text-gray-100">
        {/* Заголовок с кнопкой Share */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{title || sampleTitle}</h1>
          <button
            onClick={handleShare}
            className={`cursor-pointer group flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
              copied 
                ? 'bg-green-700' 
                : 'bg-gradient-to-r bg-gray-700'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform duration-200 ${copied ? 'rotate-0' : 'group-hover:-rotate-12'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {copied ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              )}
            </svg>
            <span className="font-medium">
              {copied ? 'Copied!' : 'Share'}
            </span>
          </button>
        </div>

        {/* Изображение */}
        {(imageUrl || sampleImageUrl) && (
          <img
            src={imageUrl || sampleImageUrl}
            alt={title || sampleTitle}
            className="w-full rounded-lg mb-6 object-cover"
          />
        )}

        {/* Дата */}
        <p className="text-sm text-gray-400 mb-4">{date || sampleDate}</p>

        {/* Контент новости */}
        <div className="prose prose-invert max-w-none">
          {(content || sampleContent).split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
}

export default ArticlePage;
