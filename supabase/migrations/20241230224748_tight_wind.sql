/*
  # Add Zaparoo NFC Card Collection System

  1. New Tables
    - `zaparoo_cards`: Stores information about physical NFC cards
    - `user_card_collection`: Links users to their collected cards
    - `card_game_mapping`: Links cards to games

  2. Security
    - Enable RLS on all tables
    - Add policies for card collection management
*/

-- Create zaparoo_cards table
CREATE TABLE zaparoo_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nfc_id text UNIQUE NOT NULL,
  card_type text NOT NULL,
  rarity text NOT NULL,
  artwork_url text,
  created_at timestamptz DEFAULT now()
);

-- Create user_card_collection table
CREATE TABLE user_card_collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid REFERENCES zaparoo_cards(id) ON DELETE CASCADE,
  collected_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_id)
);

-- Create card_game_mapping table
CREATE TABLE card_game_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid REFERENCES zaparoo_cards(id) ON DELETE CASCADE,
  system_id text REFERENCES systems(id) ON DELETE CASCADE,
  game_path text NOT NULL,
  game_title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(card_id, system_id, game_path)
);

-- Enable RLS
ALTER TABLE zaparoo_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_game_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Cards are viewable by everyone"
  ON zaparoo_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their card collection"
  ON user_card_collection FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add cards to their collection"
  ON user_card_collection FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Card mappings are viewable by everyone"
  ON card_game_mapping FOR SELECT
  TO authenticated
  USING (true);

-- Create function to add card to collection
CREATE OR REPLACE FUNCTION add_card_to_collection(
  nfc_id text,
  OUT success boolean,
  OUT error text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card_id uuid;
BEGIN
  -- Get card ID from NFC ID
  SELECT id INTO v_card_id
  FROM zaparoo_cards
  WHERE zaparoo_cards.nfc_id = add_card_to_collection.nfc_id;

  IF v_card_id IS NULL THEN
    success := false;
    error := 'Card not found';
    RETURN;
  END IF;

  -- Add card to user's collection
  INSERT INTO user_card_collection (user_id, card_id)
  VALUES (auth.uid(), v_card_id)
  ON CONFLICT (user_id, card_id) DO NOTHING;

  success := true;
  error := null;
EXCEPTION
  WHEN OTHERS THEN
    success := false;
    error := 'Failed to add card to collection';
    RETURN;
END;
$$;

-- Create view for user's collection with card details
CREATE OR REPLACE VIEW user_collection_details AS
SELECT 
  uc.user_id,
  uc.collected_at,
  zc.nfc_id,
  zc.card_type,
  zc.rarity,
  zc.artwork_url,
  cgm.system_id,
  cgm.game_path,
  cgm.game_title
FROM user_card_collection uc
JOIN zaparoo_cards zc ON zc.id = uc.card_id
LEFT JOIN card_game_mapping cgm ON cgm.card_id = zc.id;

-- Grant necessary permissions
GRANT SELECT ON user_collection_details TO authenticated;
GRANT EXECUTE ON FUNCTION add_card_to_collection TO authenticated;