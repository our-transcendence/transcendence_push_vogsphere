class Rect:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height

    def __str__(self):
        return f'({self.x}, {self.y}, {self.width}, {self.height})'

    def collide(self, other):
        return (self.x + self.width >= other.x and
                self.x <= other.x + other.width and
                self.y + self.height >= other.y and
                self.y <= other.y + other.height)

    def get_center(self):
        return {"x": self.x + self.width / 2, "y": self.y + self.height / 2}