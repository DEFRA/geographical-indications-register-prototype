class ProtectedFoodName < Document
  validates :protected_food_name_register_type, presence: true, date: true
  validates :protected_food_name_product_type, presence: true, date: true
  validates :protected_food_name_name, presence: true, date: true
  validates :protected_food_name_product_category, presence: true, date: true
  validates :protected_food_name_file_number, presence: true, date: true
  validates :protected_food_name_protection_type, presence: true, date: true
  validates :protected_food_name_country, presence: true, date: true
  validates :protected_food_name_status, presence: true, date: true
  validates :protected_food_name_date_registration, presence: true, date: true

  FORMAT_SPECIFIC_FIELDS = %i(
    protected_food_name_register_type
    protected_food_name_product_type
    protected_food_name_name
    protected_food_name_product_category
    protected_food_name_file_number
    protected_food_name_protection_type
    protected_food_name_country
    protected_food_name_status
    protected_food_name_date_registration
  ).freeze

  attr_accessor(*FORMAT_SPECIFIC_FIELDS)

  def initialize(params = {})
    super(params, FORMAT_SPECIFIC_FIELDS)
  end

  def self.title
    "Protected food name"
  end

  def primary_publishing_organisation
    "3290f63c-e08d-11ea-87d0-0242ac130003"
  end
end
